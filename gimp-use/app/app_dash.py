from dash import Dash, html, dcc, callback, Output, Input
from baml_py import Image
from baml_client.types import *


counter = 0
MAX_COUNT = 100

state = []

app = Dash(__name__)
app.layout = html.Div([
    dcc.Interval(
        id="interval-component",
        interval=3000,
        n_intervals=0
    ),
    html.Div(id='state-display', children=[
        html.H1(id='counter-header'),
        html.H2("History"),
        html.Div(id="history-display", children="Waiting for first element"),
    ])
])

@callback(
        [Output('counter-header', 'children'),
         Output('history-display', 'children')
         ],
         Input('interval-component', 'n_intervals')
)
def update_state(_):
    global state, counter
    counter_text = f"State"

    history_elements = []
    for entry in state:
        entry_div = html.Div(className="history-entry", children=[
            html.Div("Request", className="entry-header"),
            html.Div(str(entry.request)),
            # html.Pre("Test"),
            html.Div("Response", className="entry-header")
        ])

        if isinstance(entry.response, Image):
            # response_element = html.Div(children="TEST(img)")
            response_element = html.Img(
                src=f"data:image/jpeg;base64,{entry.response.as_base64()[0]}",
                style={'max-width': '300px'}
            )
        else:
            # response_element = html.Pre("test(text)")
            response_element = html.Pre(str(entry.response))
    
        entry_div.children.append(response_element)
        history_elements.append(entry_div)

    return (
        counter_text, history_elements
    )