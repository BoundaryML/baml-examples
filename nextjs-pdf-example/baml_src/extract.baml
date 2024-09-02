enum AssetType {
  Equity
  FixedIncome
  MutualFund
  ETF
  Cash
  Other
}
 
// Defining a data model.
class Position {
  asset_type AssetType
  asset_name string
  symbol string? @alias(ticker) @description(#"
    If asset is an equity add it in if it's present in the document
  "#)
  face_value float?
  quantity float? @description(#"
    If it's a bond, assume quantity of 1
  "#)
  date_acquired string? @description(#"
    The date the position or asset was acquired in ISO8601 format
  "#)
  cost_basis float?
  current_price float? @description(#"
    The column for this element likely says the word "price"
  "#)
  market_value float?  
  unit_cost float? @description(#"
    Only fill this out if the column says "cost" but it's not the cost basis. This would be the cost per unit.
  "#)
  data_quality_notes string? @description(#"
    Double check your work. If the data extracted doesn't seem to match the image or there's some ambiguity in some column or field, say so. Otherwise return null.
  "#)
}


 
 
// class Positions
 

// class
 

// Creating a function to extract the resume from a string.
function ExtractStatement(statement: image) -> Position[] {
  client ClaudeSonnet
  prompt #"
    {{ _.role("user")}}

    Extract every position from this statement. Include all the information. Make sure to include other investments and funds. Every row should be accounted. If there are any issues with the data extracted, please include a note in the data_quality_notes field.
    {{ statement }}

    {{ ctx.output_format }}
  "#
}  

function ValidateStatement(positions: string, statement: image) -> Position[] {
  client GPT4o
  prompt #"
    {{ _.role("user")}}

    These positions had an issue with the cost basis not matching the expected value. Please review the positions and output a revised structure. If no revisions are required, exclude it from the output.
    {{ positions }}
    {{ statement }}

    {{ ctx.output_format }}
  "#
}

