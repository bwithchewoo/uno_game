class GameChannel < ApplicationCable::Channel
  def subscribed
    
    ActionCable.server.broadcast "#{params[:game_id]}", "user joined!"
     stream_from "game:#{params[:game_id]}"
  end



  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    stop_stream_from "game:#{params[:game_id]}"
  end
end
