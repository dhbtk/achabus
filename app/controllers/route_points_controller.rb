class RoutePointsController < ApplicationController
  before_action :set_route_point, only: [:show, :edit, :update, :destroy, :to]

  # GET /route_points
  # GET /route_points.json
  def index
    @route_points = RoutePoint.all
  end

  # GET /route_points/1
  # GET /route_points/1.json
  def show
  end

  # GET /route_points/new
  def new
    @route_point = RoutePoint.new
  end

  # GET /route_points/1/edit
  def edit
  end

  # POST /route_points
  # POST /route_points.json
  def create
    @route_point = RoutePoint.new(route_point_params)

    respond_to do |format|
      if @route_point.save
        format.html { redirect_to @route_point, notice: 'Route point was successfully created.' }
        format.json { render :show, status: :created, location: @route_point }
      else
        format.html { render :new }
        format.json { render json: @route_point.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /route_points/1
  # PATCH/PUT /route_points/1.json
  def update
    respond_to do |format|
      if @route_point.update(route_point_params)
        format.html { redirect_to @route_point, notice: 'Route point was successfully updated.' }
        format.json { render :show, status: :ok, location: @route_point }
      else
        format.html { render :edit }
        format.json { render json: @route_point.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /route_points/1
  # DELETE /route_points/1.json
  def destroy
    @route_point.destroy
    respond_to do |format|
      format.html { redirect_to route_points_url, notice: 'Route point was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def to
    @other = RoutePoint.find(params[:other_id])
    render json: RoutePoint.route_between(@route_point, @other)
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_route_point
    @route_point = RoutePoint.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def route_point_params
    params.require(:route_point).permit(:route_id, :point_id, :order, :polyline_index)
  end
end
