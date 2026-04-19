import { Gender } from "@prisma/client";
import { useState } from "react";
import { useCreateDoctor } from "@/hooks/use-doctors";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "@/components/ui/button";
import { formatIndianPhoneNumber } from "@/lib/utils";

interface AddDoctorDialogBoxProps {
    isOpen: boolean
    onClose: () => void
}

function AddDoctorDialogBox({ isOpen, onClose }: AddDoctorDialogBoxProps) {
    const [newDoctor, setNewDoctor] = useState(
        {
            name: "",
            email: "",
            phone: "",
            specialization: "",
            experience: 0,
            imageUrl: "/default-doctor.png",
            gender: "MALE" as Gender,
            isActive: true,
            availableSlots: [] as string[],
        });
    const createDoctorMutation = useCreateDoctor();

    const handlePhoneChange = (value: string) => {
        const formattedPhoneNumber = formatIndianPhoneNumber(value)
        setNewDoctor({ ...newDoctor, phone: formattedPhoneNumber })
    }

    const handleSave = () => {
        createDoctorMutation.mutate({ ...newDoctor }, { onSuccess: handleClose })
    };

    const handleClose = () => {
        onClose();
        setNewDoctor({
            name: "",
            email: "",
            phone: "",
            specialization: "",
            experience: 0,
            imageUrl: "/default-doctor.png",
            gender: "MALE",
            isActive: true,
            availableSlots: [],
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                    <DialogDescription>Add a new doctor to your practice.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    {/*Name and Specialization Field*/}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-name">Name *</Label>
                            <Input
                                id="new-name"
                                value={newDoctor.name}
                                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                placeholder="Dr. John Smith"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-specialization">Specialization *</Label>
                            <Input
                                id="new-specialization"
                                value={newDoctor.specialization}
                                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                placeholder="Orthopedic Surgeon"
                            />
                        </div>
                    </div>

                    {/*Email Field*/}
                    <div className="space-y-2">
                        <Label htmlFor="new-email">Email *</Label>
                        <Input
                            id="new-email"
                            type="email"
                            value={newDoctor.email}
                            onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                            placeholder="doctor@example.com"
                        />
                    </div>

                    {/*Phone and Experience Field*/}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-phone">Phone</Label>
                            <Input
                                id="new-phone"
                                value={newDoctor.phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="+91 12345 67890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-experience">Experience (years)</Label>
                            <Input
                                id="new-experience"
                                type="number"
                                value={newDoctor.experience}
                                onChange={(e) => setNewDoctor({ ...newDoctor, experience: Number(e.target.value) })}
                                placeholder="5"
                            />
                        </div>
                    </div>

                    {/*Gender and Status Field*/}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-gender">Gender</Label>
                            <Select
                                value={newDoctor.gender || ""}
                                onValueChange={(value) => setNewDoctor({ ...newDoctor, gender: value as Gender })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-status">Status</Label>
                            <Select
                                value={newDoctor.isActive ? "active" : "inactive"}
                                onValueChange={(value) =>
                                    setNewDoctor({ ...newDoctor, isActive: value === "active" })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}
                        className="bg-primary hover:bg-primary/90"
                        disabled={!newDoctor.name || !newDoctor.email || !newDoctor.specialization || createDoctorMutation.isPending}
                    >
                        {createDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddDoctorDialogBox;