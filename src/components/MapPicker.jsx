import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Search } from "lucide-react";

// Fix for default icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position} interactive={false} />
  );
}

export default function MapPicker({ onConfirm, onClose }) {
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setPosition({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
        // Fly to location is handled by key change in parent, but we can force it here if needed
      } else {
        alert("Location not found.");
      }
    } catch (err) {
      alert("Error searching location.");
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!position) return alert("Please click on the map to drop a pin.");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`,
      );
      const data = await response.json();
      const addr = data.display_name || `${position.lat}, ${position.lng}`;
      onConfirm({
        address: addr,
        coordinates: `${position.lat}, ${position.lng}`,
      });
    } catch (err) {
      onConfirm({
        address: `${position.lat}, ${position.lng}`,
        coordinates: `${position.lat}, ${position.lng}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Select Location</h3>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search area, street, city..."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-white/30 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl text-sm font-medium"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      <div className="flex-1 rounded-xl overflow-hidden border border-white/10 mb-4 bg-zinc-800">
        <MapContainer
          center={[10.8505, 76.2711]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          key={position ? `${position.lat}-${position.lng}` : "map"}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <button
        onClick={handleConfirm}
        className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-white/90 transition-colors"
      >
        Confirm Location
      </button>
    </div>
  );
}
