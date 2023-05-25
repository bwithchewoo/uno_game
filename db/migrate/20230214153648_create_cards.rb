class CreateCards < ActiveRecord::Migration[6.1]
  def change
    create_table :cards do |t|
      t.belongs_to :player
      t.belongs_to :game
      t.string :color
      t.string :value
      t.boolean :in_play
      t.boolean :is_available
      t.timestamps
    end
  end
end
