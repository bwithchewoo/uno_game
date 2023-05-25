class UsersController < ApplicationController
  skip_before_action :authorize, only: [:create, :index]

  def index
    render json: User.all.pluck(:id, :username)
  end

  def create
    user = User.create!(user_params)
    session[:user_id] = user.id
    render json: user, status: :created
  end

  def show
    render json: @current_user
  end

def update_picture
  user = User.find(params[:id])
  user.update!({
    "profile_picture" => params[:profile_picture]

  })
  render json: user
end

  private

  def user_params
    params.permit(:username, :password, :password_confirmation, :user_rank, :user_points)
  end

end
