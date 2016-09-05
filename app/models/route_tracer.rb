require 'ruby-prof'
require 'priority_queue'

class RouteTracer
  @point_cache = []

  #
  # CACHE DE PONTOS
  #

  # Gera e salva o cache de distâncias entre os pontos.
  def self.calculate_point_cache
    @point_cache.clear
    i = 1
    count = RoutePoint.count
    RoutePoint.all.includes(:point).each do |rp|
      puts "#{i}/#{count}..."
      rp.cached_costs = {}
      rp.neighbors(nil, nil).each do |neighbor|
        print "*"
        rp.cached_costs[neighbor] = rp.cost_to neighbor
      end
      puts ""
      @point_cache << rp
      i += 1
    end
    save_point_cache
  end

  # Salva o cache de distâncias entre os pontos.
  def self.save_point_cache
    serialized = @point_cache.map{|rp| [rp.id, rp.cached_costs.map{|n,c| [n.id, c]}.to_h]}.to_h
    File.write('/tmp/achabus-point-cache.json', serialized.to_json)
  end

  # Carrega o cache de pontos do disco.
  # Provavelmente deveria ser removido, a não ser que gerá-lo venha a tomar um tempo absurdo (mais de um minuto?)
  def self.load_point_cache
    begin
      id_hash = JSON.parse(File.read('/tmp/achabus-point-cache.json'))
    rescue
      calculate_point_cache && save_point_cache && load_point_cache
      return
    end
    puts "Carregando..."
    @point_cache = RoutePoint.includes(:route).find(id_hash.keys)
    @point_cache.each do |rp|
      print "-> "
      rp.cached_costs = id_hash[rp.id.to_s].map do |k, v|
        print "*"
        [RoutePoint.includes(:route).find(k), v]
      end.to_h
      puts ""
    end
  end

  #
  # ROTAS A PÉ
  #

  # Retorna a distância a pé entre dois pontos.
  #
  # @param [RoutePoint||VirtualPoint] a ponto A
  # @param [RoutePoint||VirtualPoint] b ponto B
  # @return [Float] a distância
  def self.walking_distance(a, b)
    OSRM.walking_path(a.point.position.lon, a.point.position.lat, b.point.position.lon, b.point.position.lat).length
  end

  # Retorna a rota a pé entre dois pontos.
  #
  # @param [RoutePoint||VirtualPoint] a ponto A
  # @param [RoutePoint||VirtualPoint] b ponto B
  # @return [RGeo::Geographic::SphericalLineStringImpl] a rota
  def self.walking_path(a, b)
    OSRM.walking_path(a.point.position.lon, a.point.position.lat, b.point.position.lon, b.point.position.lat)
  end

  # Aqui assumimos que pessoas andam em velocidade constante.
  # A wikipédia diz que a maioria das pessoas anda a 1,4 m/s, então vamos usar este valor.
  # t = d/v
  #
  # @param [RoutePoint||VirtualPoint] a ponto A
  # @param [RoutePoint||VirtualPoint] b ponto B
  # @return [Float] o tempo em segundos
  def self.walking_time(a, b)
    walking_distance(a, b)/1.4
  end

  #
  # ROTAS DIRIGINDO
  #

  # Aqui temos um modelinho simples para o perfil de velocidade de um ônibus. Assumimos que ele acelera e desacelera a
  # 1 m/s², com velocidades máximas de 7 m/s (25,2 km/h), caso o percurso seja menor que 800 m, e 10 m/s (36 km/h) caso
  # o percurso seja maior.
  #
  # @param [Float] length o percurso entre um ponto e outro
  # @return [Float] o tempo em segundos
  def self.driving_time(length)
    length = length.to_f
    if length < 800
      top_speed = 7.0 # 39,6 km/h
    else
      top_speed = 10.0 # 61,2 km/h
    end
    # A área máxima em que o gráfico é apenas um triângulo e não um trapézio.
    triangle_area = top_speed**2
    if length <= triangle_area
      Math.sqrt(2*length)*Math.sqrt(2)
    else
      rectangle_area = length - triangle_area
      rectangle_area/top_speed + 2*top_speed
    end
  end

  #
  # PATHFINDING DE ROTAS DE ÔNIBUS
  #

  # Retorna os nós antecessores ao target.
  #
  # @param [RoutePoint||VirtualPoint] target o ponto alvo
  # @param [Hash] previous um Hash com todos os antecessores do grafo
  # @return [Array] um array de antecessores
  def self.antecessors_to(target, previous)
    path = []
    current = target
    while previous[current]
      path.unshift current
      current = previous[current]
    end
    path
  end

  # Traça uma rota entre dois [VirtualPoint]s.
  #
  # @param [VirtualPoint] source o ponto de partida
  # @param [VirtualPoint] target o ponto de destino
  # @return [Array] um array com os pontos intermediários, em ordem
  def self.dijkstra(source, target)
    maxint = (2**(0.size * 8 -2) -1)
    costs = {}
    previous = {}
    nodes = PriorityQueue.new

    ([source, target] + @point_cache).each do |rp|
      if rp == source
        costs[rp] = 0
        nodes[rp] = 0
      else
        costs[rp] = maxint
        nodes[rp] = maxint
      end
      previous[rp] = nil
    end

    while nodes.length > 0
      current = nodes.delete_min_return_key

      if current == target
        return antecessors_to(current, previous)[0..-2]
      end

      break if current.nil? || costs[current] == maxint

      current.neighbors(target, antecessors_to(current, previous)).each do |new|
        alt = costs[current] + current.cost_to(new)
        if alt < costs[new]
          costs[new] = alt
          previous[new] = current
          nodes[new] = alt
        end
      end
    end

    []
  end

  # Traça uma rota entre dois pontos.
  #
  # @param [VirtualPoint] source o ponto de partida
  # @param [VirtualPoint] target o ponto de destino
  # @return [Array] um array com os pontos intermediários, em ordem
  def self.route_between(start, finish)
    begin
      RubyProf.start
      old_level = ActiveRecord::Base.logger.level
      ActiveRecord::Base.logger.level = 1
      load_point_cache if @point_cache.empty?

      route = dijkstra(start, finish)

      ActiveRecord::Base.logger.level = old_level
    ensure
      res = RubyProf.stop
      RubyProf::GraphHtmlPrinter.new(res).print(File.open("/tmp/report.html", "w"), min_percent: 1)
    end
    File.open('/tmp/route-trace.txt', 'w') do |f|
      f << "DISCRIMINAÇÃO DOS PONTOS\n\n"
      route.each do |rp|
        f << "%s - %s/%s\n  %s\n" % [rp.route.line.identifier, rp.route.origin, rp.route.destination, rp.point.name]
      end
    end
    route_array = route.group_by{|p| p.route_id}.map do |route_id, group|
      raise 'Ordem totalmente errada!' unless group == group.sort_by { |rp| rp.order }
      {
          start_point: start,
          end_point: finish,
          route_points: group,
          points: group.map(&:point),
          route: group[0].route,
          route_path: Route.route_segment(route_id, group[0].polyline_index, group[-1].polyline_index).to_s,
          total_time: 0.upto(group.length - 2).map{|i| driving_time(Route.route_segment(route_id, group[i].polyline_index, group[i + 1].polyline_index).length)}.sum
      }
    end
    {
        route: route_array,
        walking_paths: {
            start: route[0] ? walking_path(start, route[0]) : nil,
            finish: route[-1] ? walking_path(route[-1], finish) : nil,
            between_routes: 0.upto(route_array.length - 2).map do |i|
              walking_path(route_array[i][:route_points][-1], route_array[i + 1][:route_points][0])
            end
        }
    }
  end

  def self.test_route
    old_level = ActiveRecord::Base.logger.level
    ActiveRecord::Base.logger.level = 1
    boicy = VirtualPoint.new -54.577825, -25.546901
    rodo  = VirtualPoint.new -54.562939, -25.520758
    ActiveRecord::Base.logger.level = old_level
    route_between boicy, rodo
  end
end
