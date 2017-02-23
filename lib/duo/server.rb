require 'sinatra/base'

class Duo::Server < Sinatra::Base

  set :static, false

  configure :production do
    require 'sinatra/xsendfile'
    helpers Sinatra::Xsendfile
    Sinatra::Xsendfile.replace_send_file!
    set :xsf_header, 'X-Accel-Redirect'
  end

  configure :development do
    require 'sinatra/reloader'
    register Sinatra::Reloader
  end

  get '/' do
    open( File.join(File.dirname(__FILE__), '..', '..', 'public', 'index.html') ) do |io|
      io.read
    end
  end

end
