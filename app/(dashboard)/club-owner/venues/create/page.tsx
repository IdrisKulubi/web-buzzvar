import { VenueForm } from "@/components/venues/venue-form";

export default function CreateVenuePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Venue</h1>
        <p className="text-muted-foreground mt-2">
          Add a new venue to your portfolio
        </p>
      </div>

      <div className="max-w-2xl">
        <VenueForm />
      </div>
    </div>
  );
}