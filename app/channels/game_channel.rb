class GameChannel < ApplicationCable::Channel
  def subscribed
    user = params['username']
    ActionCable.server.broadcast "#{params[:game_id]}", "#{user} joined!"
     stream_from "game:#{params[:game_id]}"
  end



  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    raise NotImplementedError
  end
end
