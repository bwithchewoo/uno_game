class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string :username
      t.string :password_digest
      t.string :profile_picture
      t.string :user_rank, default: "unranked"
      t.integer :user_points, default: 0
    end
  end
end
