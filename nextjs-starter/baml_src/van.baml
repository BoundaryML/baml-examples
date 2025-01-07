class Visibility {
  view "partial" | "full"
}

class Van {
  front Visibility | false
  back Visibility | false
  driver_side Visibility | false
  passenger_side Visibility | false
}

class VanSideAnalysis {
  visibility Van
  confidence "high" | "medium" | "low"
}

function AnalyzeVanSide(vanImage: image) -> VanSideAnalysis {
  client "openai/gpt-4o"
  prompt #"
    Analyze the image of a van.

    - This is right side driving (US roads)

    {{ ctx.output_format }}

    Before answering, the perspective of the camera, and anything else relevant.

    Example:
    - Camera: ...
    - Clues: ...
    ...

    {
      .. // SCHEMA
    }

    {{ _.role("user") }}
    {{ vanImage }}
  "#
}

enum VehicleSide {
  Front @description(#"
    The front of the vehicle. If the headlights are visible, it's the front.
  "#)
  Left @description(#"
    The left side of the vehicle.
  "#)
  Right @description(#"
    The right side of the vehicle.
  "#)
  Back @description(#"
    The back of the vehicle. If the taillights are visible, it's the back.
  "#)
}

class VehicleSideResponse {
  full_vehicle_side_visible bool @description(#"
    True if the entire vehicle side is fully visible, with no significant parts cut off or truncated.
  "#)
  vehicle_side VehicleSide?
}

function IdentifyVehicleSide(vanImage: image) -> VehicleSideResponse {
  client "openai/gpt-4o"
  prompt #"
    Identify which side of the rental van is visible in the image.
    First, ensure the entire vehicle is fully visible, with no significant parts cut off or truncated.
    Ignore any images where the cargo doors are open.
    Next, determine if the view shows the front, back, left, or right side.
    For side identification, look for side mirrors or sliding doors. This picture is of a van, so you can use the driver's cabin as a reference. If it is on the left, then you are looking at the left side. If it is on the right, then you are looking at the right side.
    {{ ctx.output_format }}

    {{_.role("user")}}
    {{vanImage}}
  "#
}



test VanBackTest {
  functions [AnalyzeVanSide, IdentifyVehicleSide]
  args {
    vanImage {
      url "https://i.imgur.com/puXGiMO.png"
    }
  }
}

test Van2Test {
  functions [AnalyzeVanSide, IdentifyVehicleSide]
  args {
    vanImage {
      url "https://i.imgur.com/UktYcV2.png"
    }
  }
}


test VanSideLeftTest {
  functions [AnalyzeVanSide]
  args {
    vanImage {
      file "./right.png"
    }
  }
}