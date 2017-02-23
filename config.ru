$:.unshift(File.dirname(__FILE__) + '/lib')

require 'duo'

use Rack::Static, urls: ["/js", "/images", "/resources"], root: "public"

run Duo::Server
