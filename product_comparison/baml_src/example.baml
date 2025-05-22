class MyOutputType {
    prompt string
    completion string
    tokens int
    model string
    time float
    cost float
    usage int
    error string
    result string
}


function FunctionName(arg:string) -> MyOutputType {
    client CustomGPT4o
    prompt #"
        Your prompt here in jinja format

        {{ arg }}
        {{ ctx.output_format }}
    "#

    

}


test test_function {
    functions [FunctionName]
    args {
        arg #"
            what is the capital of France?
        "# 
    }
}