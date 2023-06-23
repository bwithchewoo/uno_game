module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # ['_session_id'] is optional, only use it if you are using has_secure_password in your user model
      user = User.find(cookies.encrypted['_session_id']['user_id'])

      return user unless user.nil?

      reject_unauthorized_connection
    end
  end
end
