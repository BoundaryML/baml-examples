from dotenv import load_dotenv
from baml_client import b, reset_baml_env_vars
from baml_client.types import Action, Form, Message, UpdateForm
import os
from prettytable import PrettyTable
from termcolor import colored

# Load environment variables from .env file
load_dotenv()
# Ensure BAML loads with the current env vars.
reset_baml_env_vars(os.environ.copy())


def print_form(form: Form):
    table = PrettyTable()
    table.field_names = ["Field", "Value"]
    table.add_row(["Leave Type", form.leaveType or colored("missing", "yellow")])
    table.add_row(["From Date", form.fromDate or colored("missing", "yellow")])
    table.add_row(["To Date", form.toDate or colored("missing", "yellow")])
    table.add_row(["Reason", form.reason or colored("missing", "yellow")])
    table.add_row(["Salary Advance", form.salaryAdvance if form.salaryAdvance is not None else colored("missing", "yellow")])
    table.add_row(["Confidence", form.confidence or colored("missing", "yellow")])
    print(table)

def main():
    print("Hello from form-filler!")
    current_form = Form(leaveType=None, confidence=None)
    messages = []
    while True:
        res = b.Chat(current_form, messages)
        if isinstance(res, Action):
            if res.action == "cancel":
                print("Form filling cancelled.")
                return
        elif isinstance(res, UpdateForm):
            current_form = res.form
            print_form(current_form)
            if res.completed:
                print("Thanks for submitting!")
                return
            print("Bot:", res.next_question)
            messages.append(
                Message(role="assistant", content=res.next_question)
            )
            response = input("User: ")
            messages.append(
                Message(
                    content=response,
                    role="user",
                )
            )
        else:
            print("Bot:", res.message)
            response = input("User: ")
            messages.append(
                Message(role="assistant", content=res.message)
            )
            messages.append(
                Message(
                    content=response,
                    role="user",
                )
            )



if __name__ == "__main__":
    main()
