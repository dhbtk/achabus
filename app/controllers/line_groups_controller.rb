class LineGroupsController < ApplicationController
  before_action :set_line_group, only: [:show, :edit, :update, :destroy]

  # GET /line_groups
  # GET /line_groups.json
  def index
    @line_groups = LineGroup.all
  end

  # GET /line_groups/1
  # GET /line_groups/1.json
  def show
  end

  # GET /line_groups/new
  def new
    @line_group = LineGroup.new
  end

  # GET /line_groups/1/edit
  def edit
  end

  # POST /line_groups
  # POST /line_groups.json
  def create
    @line_group = LineGroup.new(line_group_params)

    respond_to do |format|
      if @line_group.save
        format.html { redirect_to @line_group, notice: 'Line group was successfully created.' }
        format.json { render :show, status: :created, location: @line_group }
      else
        format.html { render :new }
        format.json { render json: @line_group.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /line_groups/1
  # PATCH/PUT /line_groups/1.json
  def update
    respond_to do |format|
      if @line_group.update(line_group_params)
        format.html { redirect_to @line_group, notice: 'Line group was successfully updated.' }
        format.json { render :show, status: :ok, location: @line_group }
      else
        format.html { render :edit }
        format.json { render json: @line_group.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /line_groups/1
  # DELETE /line_groups/1.json
  def destroy
    @line_group.destroy
    respond_to do |format|
      format.html { redirect_to line_groups_url, notice: 'Line group was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_line_group
    @line_group = LineGroup.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def line_group_params
    params.require(:line_group).permit(:name, :city)
  end
end
