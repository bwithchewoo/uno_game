class CreatePlayers < ActiveRecord::Migration[6.1]
  def change
    create_table :players do |t|
      t.belongs_to :game
      t.belongs_to :user
      t.boolean :is_host
      t.boolean :is_bot

    end
  end
end
