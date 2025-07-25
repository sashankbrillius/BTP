import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  Grid3X3,
  List,
  Filter,
  Play,
  Clock,
  Star
} from "lucide-react";
import ResizableSidebar from '@/components/ResizableSidebar';
import "../theme.css";

export default function VideoResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');

  const mockVideos = [
    {
      id: 1,
      title: "Introduction to AIOps Fundamentals",
      duration: "15:30",
      category: "AIOps",
      difficulty: "Beginner",
      rating: 4.8,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      description: "Learn the basics of AIOps and how it transforms IT operations"
    },
    {
      id: 2,
      title: "Machine Learning for Operations",
      duration: "22:45",
      category: "MLOps",
      difficulty: "Intermediate",
      rating: 4.9,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      description: "Implementing ML models in production environments"
    },
    {
      id: 3,
      title: "Monitoring and Observability",
      duration: "18:20",
      category: "AIOps",
      difficulty: "Advanced",
      rating: 4.7,
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      description: "Advanced monitoring techniques and observability practices"
    }
  ];

  const categories = ['all', 'AIOps', 'MLOps', 'DevOps', 'Cloud'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ResizableSidebar activeSection="video-resources" />
      
      <div 
        className="flex-1 transition-all duration-300" 
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 text-blue-500" />
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Video Resources</CardTitle>
                      <CardDescription>Comprehensive video library for learning</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {mockVideos.map(video => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {viewMode === 'grid' ? (
                    <>
                      <div className="relative">
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <Play className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {video.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{video.category}</Badge>
                            <Badge variant="secondary">{video.difficulty}</Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{video.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-40 aspect-video bg-gray-200 rounded flex items-center justify-center">
                            <Play className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            {video.duration}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{video.category}</Badge>
                              <Badge variant="secondary">{video.difficulty}</Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{video.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{video.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" className="px-8">
                Load More Videos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}