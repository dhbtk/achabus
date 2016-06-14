require 'test_helper'

class RoutesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @route = routes(:one)
  end

  test "should get index" do
    get routes_url
    assert_response :success
  end

  test "should get new" do
    get new_route_url
    assert_response :success
  end

  test "should create route" do
    assert_difference('Route.count') do
      post routes_url, params: {route: {line_id: @route.line_id, name: @route.name, parent_route_id: @route.parent_route_id, route: @route.route, route_path_markers: @route.route_path_markers, short_name: @route.short_name}}
    end

    assert_redirected_to route_path(Route.last)
  end

  test "should show route" do
    get route_url(@route)
    assert_response :success
  end

  test "should get edit" do
    get edit_route_url(@route)
    assert_response :success
  end

  test "should update route" do
    patch route_url(@route), params: {route: {line_id: @route.line_id, name: @route.name, parent_route_id: @route.parent_route_id, route: @route.route, route_path_markers: @route.route_path_markers, short_name: @route.short_name}}
    assert_redirected_to route_path(@route)
  end

  test "should destroy route" do
    assert_difference('Route.count', -1) do
      delete route_url(@route)
    end

    assert_redirected_to routes_path
  end
end
