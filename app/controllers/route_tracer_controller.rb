class RouteTracerController < ApplicationController
  POINT_REGEX = /^([-+]?[0-9]*\.?[0-9]+,[-+]?[0-9]*\.?[0-9]+:)+[-+]?[0-9]*\.?[0-9]+,[-+]?[0-9]*\.?[0-9]+$/
  POINT_ROUTING_REGEX = /([-+]?[0-9]*\.?[0-9]+,[-+]?[0-9]*\.?[0-9]+:)+[-+]?[0-9]*\.?[0-9]+,[-+]?[0-9]*\.?[0-9]+/
  skip_before_action :authenticate_admin!, except: [:driving_path]
  def trace
    @source = VirtualPoint.new(params[:src_lon], params[:src_lat])
    @destination = VirtualPoint.new(params[:dest_lon], params[:dest_lat])

    @route = RouteTracer.route_between(@source, @destination)
  end

  def walking_path
    factory = RGeo::Geographic.spherical_factory(srid: 4326)
    source = factory.parse_wkt("POINT (#{params[:src_lon]} #{params[:src_lat]})")
    dest = factory.parse_wkt("POINT (#{params[:dest_lon]} #{params[:dest_lat]})")

    render json: {wkt: RouteTracer.walking_path(source, dest).to_s}
  end

  def driving_path
    render json: {wkt: OSRM.driving_path(params[:src_lon], params[:src_lat], params[:dst_lon], params[:dst_lat])}
  end

  # Aqui definimos o parâmetro points como sendo uma query string do mesmo formato que é esperado pelo OSRM.
  def route_total_path
    raise 'Formato inválido dos pontos!' unless POINT_REGEX =~ params[:points]
    points = params[:points].split(':').map{|p| lon, lat = p.split(','); OpenStruct.new(lon: lon.to_f, lat: lat.to_f)}
    render json: {wkt: OSRM.full_driving_path(points)}
  end
end
