Rails.application.routes.draw do
  devise_for :admins

  resources :route_points do
    member do
      get 'to'
    end
    collection do
      get 'closest_to'
    end
  end
  resources :points do
    member do
      post 'forward'
      post 'backward'
      post 'left'
      post 'right'
    end
  end
  get 'trace_route', to: 'route_tracer#trace'
  get 'walking_path', to: 'route_tracer#walking_path'
  get 'driving_path', to: 'route_tracer#driving_path'


  resources :lines do
    resources :timetables, shallow: true
    resources :routes, shallow: true
  end
  resources :line_groups

  scope '/admin' do
    root to: 'router#admin'
  end

  root to: 'router#frontend'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
