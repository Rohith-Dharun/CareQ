import { Button } from "../ui/button";
import { ChevronLeftIcon, ClockIcon, Loader2Icon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { useBookedTimeSlots, useAppointmentTypes } from "@/hooks/use-appointments";
import type { AppointmentType } from "@prisma/client";
import { generateDynamicTimeSlots } from "@/lib/utils/time-slots";

interface TimeSelectionStepProps {
    selectedDoctorId: string | null;
    selectedDate: string;
    selectedTime: string;
    selectedType: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onTypeChange: (type: string) => void;
    onBack: () => void;
    onContinue: () => void;
}

function getNext5Days(): string[] {
    const dates: string[] = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    for (let i = 0; i < 5; i++) {
        const d = new Date(tomorrow);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
}

function TimeSelectionStep({
    onBack,
    onTimeChange,
    onTypeChange,
    onDateChange,
    onContinue,
    selectedTime,
    selectedType,
    selectedDoctorId,
    selectedDate,
}: TimeSelectionStepProps) {
    if (!selectedDoctorId) return null;

    const { data: bookedAppointments = [], isLoading: slotsLoading } = useBookedTimeSlots(
        selectedDoctorId,
        selectedDate
    );
    const { data: appointmentTypes = [], isLoading: typesLoading } = useAppointmentTypes();

    const availableDates = getNext5Days();
    const selectedTypeObj = appointmentTypes.find((t: AppointmentType) => t.id === selectedType);

    const dynamicSlots =
        selectedTypeObj && selectedDate
            ? generateDynamicTimeSlots(
                selectedTypeObj.duration,
                bookedAppointments as { time: string; duration: number }[]
            )
            : [];

    const handleDateSelect = (date: string) => {
        onDateChange(date);
        onTimeChange("");
    };

    const handleTypeSelect = (typeId: string) => {
        onTypeChange(typeId);
        onTimeChange("");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={onBack}>
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h2 className="text-2xl font-semibold">Select Date &amp; Time</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Appointment type */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Appointment Type</h3>
                    {typesLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                            Loading types…
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointmentTypes.map((type: AppointmentType) => (
                                <Card
                                    key={type.id}
                                    className={`cursor-pointer transition-all hover:shadow-sm ${selectedType === type.id ? "ring-2 ring-primary" : ""}`}
                                    onClick={() => handleTypeSelect(type.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium">{type.name}</h4>
                                                {type.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-1">{type.duration} min</p>
                                            </div>
                                            <span className="font-semibold text-primary">
                                                ₹{type.price.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date & time */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Available Dates</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {availableDates.map((date) => (
                            <Button
                                key={date}
                                variant={selectedDate === date ? "default" : "outline"}
                                onClick={() => handleDateSelect(date)}
                                className="h-auto p-3"
                            >
                                <div className="text-center">
                                    <div className="font-medium">
                                        {new Date(date).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>

                    {selectedDate && !selectedType && (
                        <p className="text-sm text-muted-foreground">← Select an appointment type first to see time slots.</p>
                    )}

                    {selectedDate && selectedType && (
                        <div className="space-y-3">
                            <h4 className="font-medium">Available Times</h4>
                            {slotsLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2Icon className="w-4 h-4 animate-spin" />
                                    Loading slots…
                                </div>
                            ) : dynamicSlots.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {dynamicSlots.map((slot) => (
                                        <Button
                                            key={slot.time}
                                            variant={selectedTime === slot.time ? "default" : "outline"}
                                            onClick={() => slot.available && onTimeChange(slot.time)}
                                            size="sm"
                                            disabled={!slot.available}
                                            className={!slot.available ? "opacity-50 cursor-not-allowed line-through" : ""}
                                        >
                                            <ClockIcon className="w-3 h-3 mr-1 shrink-0" />
                                            <span className="text-xs">{slot.displayLabel}</span>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedType && selectedDate && selectedTime && (
                <div className="flex justify-end">
                    <Button onClick={onContinue}>Review Booking</Button>
                </div>
            )}
        </div>
    );
}

export default TimeSelectionStep;
