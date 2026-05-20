/**
 * Stay & Meals Page
 *
 * Complete accommodation information with booking.
 */

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RoomTypeCard } from './components/RoomTypeCard';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';
import { BookingForm } from './components/BookingForm';
import { RulesSection } from './components/RulesSection';
import { stayData } from './data';
import type { Room } from '../types';

const StayPage = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
    // Scroll to booking form
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedRoom(null);
  };

  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Stay & Meals
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comfortable accommodation options with optional meal plans for your stay
          </p>
        </div>

        {/* Room Types */}
        <section className="mb-12">
          <h2 className="font-display text-3xl font-bold mb-6">Room Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stayData.rooms.map((room) => (
              <RoomTypeCard key={room.id} room={room} onBook={handleBookRoom} />
            ))}
          </div>
        </section>

        {/* Availability Calendar */}
        <section className="mb-12">
          <AvailabilityCalendar
            availability={stayData.availability}
            roomId={selectedRoom?.id}
          />
        </section>

        {/* Booking Form */}
        <section id="booking-form" className="mb-12">
          {showBookingForm ? (
            <BookingForm rooms={stayData.rooms} onBookingSuccess={handleBookingSuccess} />
          ) : (
            <div className="text-center p-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-4">
                Select a room type above to begin your booking
              </p>
            </div>
          )}
        </section>

        {/* Rules Section */}
        {stayData.rooms[0] && (
          <section>
            <RulesSection rules={stayData.rooms[0].rules || []} />
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default StayPage;
