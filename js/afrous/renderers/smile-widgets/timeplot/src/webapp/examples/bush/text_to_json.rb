
class ApprovalStat
  
  attr_accessor :date
  attr_accessor :approve
  attr_accessor :disapprove
  attr_accessor :unsure
  
  def initialize(date, approve, disapprove, unsure)
    self.date = date
    self.approve = approve
    self.disapprove = disapprove
    self.unsure = unsure
  end
  
  
  def print
    puts "Approve #{self.approve}, Disapprove #{self.disapprove}"
  end
  
  
  def to_json
    "{'date':'#{self.date}', 'approve':'#{self.approve}', 'disapprove':'#{self.disapprove}', 'unsure':'#{self.unsure}'}"
  end
  
end


File.open('bush_ratings.json', 'a') {|f| f.write('[') }
counter = 0
File.open("bush_ratings.txt", "r") do |infile|
  while (line = infile.gets)
    #puts "#{counter}: #{line}"
    counter = counter + 1
    
    words = line.split(',')
    stat = ApprovalStat.new(words[0], words[1], words[2], words[3].chomp)
    if counter > 1
      File.open('bush_ratings.json', 'a') {|f| f.write(',') }
    end
    File.open('bush_ratings.json', 'a') {|f| f.write(stat.to_json) }
  end
end

File.open('bush_ratings.json', 'a') {|f| f.write(']') }


