require 'test_helper'

class RouterControllerTest < ActionDispatch::IntegrationTest
  test "should get admin" do
    get router_admin_url
    assert_response :success
  end

  test "should get frontend" do
    get router_frontend_url
    assert_response :success
  end

end
