# VAPI Assistant Configuration for CareQ

## Step 1: Create Assistant in VAPI Dashboard

Go to [https://vapi.ai](https://vapi.ai) and create a new assistant.

## Step 2: System Prompt

```
You are JARVIS, a helpful hospital appointment booking assistant for CareQ Hospital.

Help patients book appointments by:
1. Understanding their medical needs
2. Finding available doctors by specialization
3. Showing available time slots for a chosen doctor and date
4. Booking appointments automatically

**Important Guidelines:**
- Always greet the patient by name (their name is provided as a variable).
- Be friendly, professional, and efficient.
- When looking for doctors, ask about their medical concern first, then match to a specialization.
- Always confirm the doctor, date, and time before booking.
- After booking, inform the patient that a confirmation email will be sent.
- For the `clerkUserId`, use the variable {{clerkUserId}} provided at call start.
- Dates should be in YYYY-MM-DD format.
- Times should be in HH:MM 24-hour format.

**Available Specializations:** Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, General Medicine, ENT, Ophthalmology, Psychiatry, Gynecology
```

## Step 3: Add Function Tools

### Tool 1: get_available_doctors
```json
{
  "type": "function",
  "function": {
    "name": "get_available_doctors",
    "description": "Get list of available doctors, optionally filtered by specialization",
    "parameters": {
      "type": "object",
      "properties": {
        "specialization": {
          "type": "string",
          "description": "Doctor specialization (e.g., Cardiology, Dermatology, Neurology)"
        }
      }
    }
  },
  "server": {
    "url": "https://YOUR_DOMAIN.com/api/vapi/get-available-doctors",
    "method": "POST"
  }
}
```

### Tool 2: get_available_slots
```json
{
  "type": "function",
  "function": {
    "name": "get_available_slots",
    "description": "Get available time slots for a specific doctor on a specific date",
    "parameters": {
      "type": "object",
      "properties": {
        "doctorId": {
          "type": "string",
          "description": "The doctor's ID"
        },
        "date": {
          "type": "string",
          "description": "Date in YYYY-MM-DD format"
        },
        "appointmentTypeId": {
          "type": "string",
          "description": "Optional appointment type ID for duration-aware slot generation"
        }
      },
      "required": ["doctorId", "date"]
    }
  },
  "server": {
    "url": "https://YOUR_DOMAIN.com/api/vapi/get-available-slots",
    "method": "POST"
  }
}
```

### Tool 3: book_appointment
```json
{
  "type": "function",
  "function": {
    "name": "book_appointment",
    "description": "Book an appointment for the patient. This creates the appointment and sends a confirmation email.",
    "parameters": {
      "type": "object",
      "properties": {
        "clerkUserId": {
          "type": "string",
          "description": "The patient's Clerk user ID (use the {{clerkUserId}} variable)"
        },
        "doctorId": {
          "type": "string",
          "description": "The doctor's ID"
        },
        "date": {
          "type": "string",
          "description": "Date in YYYY-MM-DD format"
        },
        "time": {
          "type": "string",
          "description": "Time in HH:MM format (24-hour)"
        },
        "appointmentTypeId": {
          "type": "string",
          "description": "Optional appointment type ID"
        },
        "reason": {
          "type": "string",
          "description": "Reason for visit"
        }
      },
      "required": ["clerkUserId", "doctorId", "date", "time"]
    }
  },
  "server": {
    "url": "https://YOUR_DOMAIN.com/api/vapi/book-appointment",
    "method": "POST"
  }
}
```

## Step 4: Configure Variables

In the VAPI assistant settings, add these assistant variables:
- `userName` — Patient's first name (passed from VapiWidget)
- `clerkUserId` — Patient's Clerk user ID (passed from VapiWidget)

## Step 5: Enable Server-side Function Execution

In VAPI settings, enable **"Server-side function execution"** so the assistant can call your API routes directly.

## Step 6: Replace URLs

Replace `YOUR_DOMAIN.com` in all tool server URLs with your actual deployed domain (e.g., `careq.vercel.app`).

## Step 7: Test

Test the complete flow in the VAPI playground:
1. Say "I need a cardiologist"
2. The AI should call `get_available_doctors` and list them
3. Pick a doctor — AI calls `get_available_slots`
4. Pick a time — AI calls `book_appointment`
5. Verify the appointment appears in the admin panel
