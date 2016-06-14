class HomeController < ApplicationController
  skip_before_action :auth_basic_temp

  def show
    render :show, layout: false
  end
end
