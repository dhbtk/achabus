class RoutesController < ApplicationController
  before_action :set_route, only: [:show, :update, :destroy]

  # GET /lines/:line_id/routes.json
  def index
    @routes = Line.find(params[:line_id]).routes
    if params[:origin] && params[:destination]
      @routes = Line.find(params[:line_id]).routes.where(origin: params[:origin], destination: params[:destination])
    end
  end

  # GET /routes/1.json
  def show
  end

  # POST /routes
  # POST /routes.json
  def create
    @route = Route.new(route_params)

    respond_to do |format|
      if @route.save
        format.json { render :show, status: :created, location: @route }
      else
        format.json { render json: @route.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /routes/1
  # PATCH/PUT /routes/1.json
  def update
    respond_to do |format|
      if @route.update(route_params) && @route.route_points.destroy_all
        format.json { render :show, status: :ok, location: @route }
      else
        format.json { render json: @route.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /routes/1
  # DELETE /routes/1.json
  def destroy
    @route.destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_route
    @route = Route.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def route_params
    params.require(:route).permit(:origin, :destination, :observation, :route, :line_id)
  end
end
