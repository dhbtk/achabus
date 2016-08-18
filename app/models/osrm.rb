class OSRM
  SERVER_ADDRESS = '127.0.0.1'
  WALKING_PORT = 5000
  DRIVING_PORT = 4999

  # @return [RGeo::Geographic::SphericalLineStringImpl] caminho
  def self.walking_path(src_lon, src_lat, dst_lon, dst_lat)
    route_path(SERVER_ADDRESS, WALKING_PORT, 'walking', src_lon, src_lat, dst_lon, dst_lat)
  end

  # @return [RGeo::Geographic::SphericalLineStringImpl] caminho
  def self.driving_path(src_lon, src_lat, dst_lon, dst_lat)
    route_path(SERVER_ADDRESS, DRIVING_PORT, 'driving', src_lon, src_lat, dst_lon, dst_lat)
  end

  private

  # @return [RGeo::Geographic::SphericalLineStringImpl] caminho
  def self.route_path(address, port, profile, src_lon, src_lat, dst_lon, dst_lat)
    url = "http://#{address}:#{port}/route/v1/#{profile}/#{src_lon},#{src_lat};#{dst_lon},#{dst_lat}"
    response = RestClient.get(url, params: {overview: :full, geometries: :geojson})
    root_json = JSON::parse(response.body)
    raise 'Rota retornada pelo OSRM está vazia!' unless root_json['routes'].count > 0
    geo_json = RGeo::GeoJSON.decode({'type' => 'Feature', 'geometry' => root_json['routes'][0]['geometry']}, {json_parser: :json})
    raise 'GeoJSON criado a partir da resposta do OSRM está inválido!' unless geo_json
    RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(geo_json.geometry.as_text)
  end
end
