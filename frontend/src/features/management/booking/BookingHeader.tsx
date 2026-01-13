import { FileText } from 'lucide-react';

export default function BookingHeader() {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Booking Management
                </h1>
                <p className="text-gray-500 mt-2">Manage customer bookings and view details</p>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
                <FileText size={24} className="text-blue-600" />
            </div>
        </div>
    );
}
