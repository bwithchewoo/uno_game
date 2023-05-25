class CreateGames < ActiveRecord::Migration[6.1]
  def change
    create_table :games do |t|
      t.string :direction
      t.integer :current_player_id
      t.integer :player_count
      t.boolean :has_started
      t.boolean :bot_fill
      t.integer :player_order, array: true, default: []
      t.timestamps
    end
  end
end
