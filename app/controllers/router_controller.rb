class RouterController < ApplicationController
  layout false
  skip_before_action :auth_basic_temp, only: [:frontend]
  def admin
  end

  def frontend
  end
end
