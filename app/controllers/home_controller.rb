class HomeController < ApplicationController
  def show
    render :show, layout: false
  end
end
