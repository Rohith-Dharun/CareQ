"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    bookAppointment,
    cancelAppointment,
    getAppointments,
    getBookedTimeSlots,
    getUserAppointments,
    updateAppointmentStatus,
} from "@/lib/actions/appointments";
import { getAppointmentTypes } from "@/lib/actions/appointment-types";

export function useGetAppointments() {
    return useQuery({
        queryKey: ["getAppointments"],
        queryFn: getAppointments,
    });
}

export function useBookedTimeSlots(doctorId: string, date: string) {
    return useQuery({
        queryKey: ["getBookedTimeSlots", doctorId, date],
        queryFn: () => getBookedTimeSlots(doctorId!, date),
        enabled: !!doctorId && !!date,
    });
}

export function useAppointmentTypes() {
    return useQuery({
        queryKey: ["getAppointmentTypes"],
        queryFn: getAppointmentTypes,
        staleTime: 5 * 60 * 1000,
    });
}

export function useBookAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bookAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
            queryClient.invalidateQueries({ queryKey: ["getBookedTimeSlots"] });
        },
        onError: (error) => console.error("Failed to book appointment:", error),
    });
}

export function useCancelAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
            queryClient.invalidateQueries({ queryKey: ["getBookedTimeSlots"] });
        },
        onError: (error) => console.error("Failed to cancel appointment:", error),
    });
}

export function useUserAppointments() {
    return useQuery({
        queryKey: ["getUserAppointments"],
        queryFn: getUserAppointments,
    });
}

export function useUpdateAppointmentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateAppointmentStatus(id, status as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
        },
        onError: (error) => console.error("Failed to update appointment:", error),
    });
}
