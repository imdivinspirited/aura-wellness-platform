/**
 * Videos & Talks - Video Grid
 *
 * Responsive grid layout for videos.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VideoCard } from './VideoCard';
import { VideoPlayer } from './VideoPlayer';
import type { Video } from '../../types';

interface VideoGridProps {
  videos: Video[];
  searchQuery?: string;
}

const VIDEOS_PER_PAGE = 16;

export const VideoGrid = ({ videos, searchQuery }: VideoGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Filter videos by search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return videos;
    }

    const query = searchQuery.toLowerCase().trim();
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.speaker.name.toLowerCase().includes(query) ||
        video.category.name.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * VIDEOS_PER_PAGE,
    currentPage * VIDEOS_PER_PAGE
  );

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">No videos found</p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {paginatedVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <VideoCard video={video} onPlay={setSelectedVideo} />
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-5xl p-0">
          {selectedVideo && <VideoPlayer video={selectedVideo} />}
        </DialogContent>
      </Dialog>
    </>
  );
};
