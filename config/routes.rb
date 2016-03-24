Rails.application.routes.draw do
  resources :points do
    member do
      post 'forward'
      post 'backward'
      post 'left'
      post 'right'
    end
  end
  get 'map_editor', to: 'map_editor#show'

  resources :routes
  resources :lines
  resources :line_groups
  root to: 'home#show'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  # Serve websocket cable requests in-process
  # mount ActionCable.server => '/cable'
end
