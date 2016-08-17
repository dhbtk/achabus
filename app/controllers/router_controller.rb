class RouterController < ApplicationController
  layout false
  skip_before_action :authenticate_admin!, only: [:frontend]
  def admin
  end

  def frontend
  end
end
