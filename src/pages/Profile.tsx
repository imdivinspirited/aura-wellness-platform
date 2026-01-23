/**
 * User Profile Page
 *
 * Comprehensive user profile with dashboard, settings, and account management.
 */

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  ShoppingCart,
  BookOpen,
  Bell,
  Shield,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PROFILE_STORAGE_KEY = 'user-profile-data';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

function loadProfileData(user: any): ProfileData {
  // Try to load from localStorage first
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        name: parsed.name || user?.name || 'Guest User',
        email: parsed.email || user?.email || 'guest@example.com',
        phone: parsed.phone || user?.phone || '',
        dob: parsed.dob || '',
        address: parsed.address || '',
        city: parsed.city || '',
        state: parsed.state || '',
        country: parsed.country || 'India',
        pincode: parsed.pincode || '',
      };
    } catch (error) {
      console.error('Failed to parse stored profile data:', error);
    }
  }

  // Fallback to user data from auth
  return {
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    phone: user?.phone || '',
    dob: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  };
}

export default function Profile() {
  const { cart, itemCount } = useCartStore();
  const { notifications, unreadCount } = useNotificationStore();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(() => loadProfileData(user));
  const [originalData, setOriginalData] = useState<ProfileData>(profileData);

  // Load profile data when user changes
  useEffect(() => {
    const loaded = loadProfileData(user);
    setProfileData(loaded);
    setOriginalData(loaded);
  }, [user]);

  const handleSave = () => {
    // Save to localStorage (in production, also save to backend API)
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      setOriginalData(profileData);
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
      
      // In production, also call API:
      // await updateUserProfile(profileData);
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Failed to save',
        description: 'Could not save your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-light mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account, preferences, and activity</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Summary Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" alt={profileData.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{profileData.name}</CardTitle>
                      <CardDescription>{profileData.email}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cart Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{itemCount}</p>
                      <p className="text-xs text-muted-foreground">Items in cart</p>
                    </div>
                  </div>
                  {itemCount > 0 && (
                    <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                      <Link to="/cart">View Cart</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Enrolled</p>
                    </div>
                  </div>
                  <Button variant="link" className="mt-2 p-0 h-auto" asChild>
                    <Link to="/programs">Browse Programs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Bell className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{unreadCount}</p>
                      <p className="text-xs text-muted-foreground">Unread</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart && cart.items.length > 0 ? (
                    cart.items.slice(0, 5).map((item) => (
                      <div key={item.itemId} className="flex items-center gap-4 pb-4 border-b last:border-0">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{item.itemType}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No recent activity. Start exploring our programs!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={profileData.pincode}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                </div>
                <Button>
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA Status</p>
                    <p className="text-sm text-muted-foreground">Not enabled</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
