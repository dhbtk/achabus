class RouteTracerController < ApplicationController
  def trace
    @source = VirtualPoint.new(params[:src_lon], params[:src_lat])
    @destination = VirtualPoint.new(params[:dest_lon], params[:dest_lat])

    @path = RouteTracer.route_between(@source, @destination)
  end
end
