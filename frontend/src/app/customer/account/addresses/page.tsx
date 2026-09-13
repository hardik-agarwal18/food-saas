'use client';

import { useCustomerAddresses } from '@/features/customer/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin } from 'lucide-react';

export default function AddressesPage() {
  const { data: addresses, isLoading } = useCustomerAddresses();

  if (isLoading) return <div>Loading addresses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold tracking-tight">Saved Addresses</h3>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>
      
      {addresses && addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {address.label}
                      {address.isDefault && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.streetAddress}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm">Edit</Button>
                  {!address.isDefault && (
                    <Button variant="outline" size="sm">Set Default</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center text-muted-foreground flex flex-col items-center">
            <MapPin className="h-12 w-12 text-muted mb-4" />
            <p>You have no saved addresses.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
