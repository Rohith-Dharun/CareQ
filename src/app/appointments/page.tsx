"use client";
import { useState, useTransition } from "react";
import NavBar from "@/components/NavBar";
import ProgressSteps from "@/components/Appointments Page/ProgressSteps";
import DoctorSelectionStep from "@/components/Appointments Page/DoctorSelectionStep";
import TimeSelectionStep from "@/components/Appointments Page/TimeSelectionStep";
import { useBookAppointment, useUserAppointments, useCancelAppointment, useAppointmentTypes } from "@/hooks/use-appointments";
import BookingConfirmationStep from "@/components/Appointments Page/BookingConfirmationStep";
import { toast } from "sonner";
import { generateAvatar } from "@/lib/utils";
import { format } from "date-fns";
import { AppointmentConfirmationModal } from "@/components/Appointments Page/AppointmentCofrimationModal";
import type { AppointmentType } from "@prisma/client";
import { XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function AppointmentsPage() {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [bookedAppointment, setBookedAppointment] = useState<any>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const bookAppointmentMutation = useBookAppointment();
    const cancelAppointmentMutation = useCancelAppointment();
    const { data: userAppointments = [] } = useUserAppointments();
    const { data: appointmentTypes = [] } = useAppointmentTypes();
    const [, startTransition] = useTransition();

    const handleSelectDoctor = (doctorId: string) => {
        setSelectedDoctorId(doctorId);
        setSelectedDate("");
        setSelectedTime("");
        setSelectedType("");
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctorId || !selectedDate || !selectedTime) {
            toast.error("Please fill in all the required fields");
            return;
        }

        const appointmentType = appointmentTypes.find((t: AppointmentType) => t.id === selectedType);

        bookAppointmentMutation.mutate(
            {
                doctorId: selectedDoctorId,
                date: selectedDate,
                time: selectedTime,
                reason: appointmentType?.name,
                appointmentTypeId: selectedType || undefined,
            },
            {
                onSuccess: async (appointment) => {
                    setBookedAppointment(appointment);

                    try {
                        await fetch("/api/send-appointment-email", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                userEmail: appointment.patientEmail,
                                doctorName: appointment.doctorName,
                                appointmentDate: format(new Date(appointment.date), "EEEE, MMMM d, yyyy"),
                                appointmentTime: appointment.time,
                                appointmentType: appointmentType?.name,
                                duration: appointmentType?.duration,
                                price: appointmentType ? `₹${appointmentType.price.toLocaleString("en-IN")}` : undefined,
                            }),
                        });
                    } catch (err) {
                        console.error("Error sending confirmation email:", err);
                    }

                    setShowConfirmationModal(true);
                    setSelectedDoctorId(null);
                    setSelectedTime("");
                    setSelectedType("");
                    setSelectedDate("");
                    setCurrentStep(1);
                },
                onError: (error) => toast.error(`Failed to book your appointment: ${error.message}`),
            }
        );
    };

    const handleCancelAppointment = (appointmentId: string) => {
        setCancellingId(appointmentId);
        startTransition(async () => {
            try {
                await cancelAppointmentMutation.mutateAsync(appointmentId);
                toast.success("Appointment cancelled successfully.");
            } catch (err: any) {
                toast.error(err.message ?? "Failed to cancel appointment.");
            } finally {
                setCancellingId(null);
            }
        });
    };

    return (
        <>
            <NavBar />
            <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
                    <p className="text-muted-foreground">Find and book appointments with verified doctors.</p>
                </div>
                <ProgressSteps currentStep={currentStep} />
                {currentStep === 1 && (
                    <DoctorSelectionStep
                        selectedDoctorId={selectedDoctorId}
                        onContinue={() => setCurrentStep(2)}
                        onSelectDoctor={handleSelectDoctor}
                    />
                )}
                {currentStep === 2 && (
                    <TimeSelectionStep
                        selectedDoctorId={selectedDoctorId}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        selectedType={selectedType}
                        onDateChange={setSelectedDate}
                        onTimeChange={setSelectedTime}
                        onTypeChange={setSelectedType}
                        onBack={() => setCurrentStep(1)}
                        onContinue={() => setCurrentStep(3)}
                    />
                )}
                {currentStep === 3 && selectedDoctorId && (
                    <BookingConfirmationStep
                        selectedDoctorId={selectedDoctorId}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        selectedType={selectedType}
                        isBooking={bookAppointmentMutation.isPending}
                        onBack={() => setCurrentStep(2)}
                        onModify={() => setCurrentStep(2)}
                        onConfirm={handleBookAppointment}
                    />
                )}
            </div>

            {bookedAppointment && (
                <AppointmentConfirmationModal
                    open={showConfirmationModal}
                    onOpenChange={setShowConfirmationModal}
                    appointmentDetails={{
                        doctorName: bookedAppointment.doctorName,
                        appointmentDate: format(new Date(bookedAppointment.date), "EEEE, MMMM d, yyyy"),
                        appointmentTime: bookedAppointment.time,
                        userEmail: bookedAppointment.patientEmail,
                    }}
                />
            )}

            {userAppointments.filter((a: any) => a.status !== "CANCELLED").length > 0 && (
                <div className="mb-8 max-w-7xl mx-auto px-6 py-8">
                    <h2 className="text-xl font-semibold mb-4">Your Upcoming Appointments</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {userAppointments
                            .filter((a: any) => a.status !== "CANCELLED")
                            .map((appointment: any) => (
                                <div key={appointment.id} className="bg-card border rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={generateAvatar(appointment.doctorGender).src}
                                            alt={appointment.doctorName}
                                            className="size-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium text-sm">{appointment.doctorName}</p>
                                            <p className="text-muted-foreground text-xs">{appointment.reason}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm mb-3">
                                        <p className="text-muted-foreground">
                                            📅 {format(new Date(appointment.date), "MMM d, yyyy")}
                                        </p>
                                        <p className="text-muted-foreground">🕐 {appointment.time} ({appointment.duration} min)</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        disabled={cancellingId === appointment.id || cancelAppointmentMutation.isPending}
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                    >
                                        <XCircleIcon className="w-3 h-3 mr-1" />
                                        {cancellingId === appointment.id ? "Cancelling…" : "Cancel"}
                                    </Button>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default AppointmentsPage;
