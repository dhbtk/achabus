require 'test_helper'

class MapEditorControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get map_editor_show_url
    assert_response :success
  end

end
