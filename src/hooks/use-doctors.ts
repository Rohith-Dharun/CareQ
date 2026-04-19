"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDoctor, getAvailableDoctors, getDoctors, updateDoctor } from "@/lib/actions/doctors";

export function useGetDoctors() {
    const result = useQuery({
        queryKey: ["getDoctors"],
        queryFn: getDoctors,
    });
    return result;
}

export function useCreateDoctor() {
    const queryClient = useQueryClient();
    const result = useMutation(
        {
            mutationFn: createDoctor,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
            },
            onError: (error) => console.log("Error while creating doctor")
        });
    return result;
}

export function useUpdateDoctor() {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: (doctor: any) => {
                const { id, _count, appointmentCount, createdAt, updatedAt, ...data } = doctor;
                return updateDoctor(id, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
                queryClient.invalidateQueries({ queryKey: ["getAvailableDoctors"] });
            },
            onError: (error) => console.error("Failed to update doctor", error),
        });
}

export function useAvailableDoctors() {
    const result = useQuery({
        queryKey: ["getAvailableDoctors"],
        queryFn: getAvailableDoctors,
    })
    return result;
}
