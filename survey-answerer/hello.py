import dotenv

dotenv.load_dotenv()

import asyncio
from typing import List, Dict
from baml_client import b
from baml_client.types import SurveyQuestion, Answer, SurveyStatus
from baml_client.tracing import trace

class SurveyManager:
    def __init__(self, questions: List[SurveyQuestion]):
        self.questions = questions
        self.answers: Dict[str, Answer] = {}
        self.status = SurveyStatus(
            completedQuestions=[],
            nextQuestionId=questions[0].id,
            surveyComplete=False,
            overallProgress="not_started"
        )

    def get_question_by_id(self, question_id: str) -> SurveyQuestion:
        return next(q for q in self.questions if q.id == question_id)

    @trace
    def process_response(self, response: str) -> None:
        current_question = self.get_question_by_id(self.status.nextQuestionId)
        
        # Analyze the response
        answer = b.AnalyzeResponse(
            question=current_question,
            response=response
        )
        self.answers[current_question.id] = answer
        
        # Update survey status
        self.status = b.DetermineNextQuestion(
            questions=self.questions,
            previousAnswers=self.answers.values(),
            currentStatus=self.status
        )

@trace
def main():
    # Define your survey questions
    questions = [
        SurveyQuestion(
            id="q1",
            text="How satisfied are you with the overall purchase process?",
            type="rating",
            options=["1", "2", "3", "4", "5"]
        ),
        SurveyQuestion(
            id="q2",
            text="How satisfied are you with the performance of your new vehicle?",
            type="rating",
            options=["1", "2", "3", "4", "5"]
        ),
        SurveyQuestion(
            id="q3",
            text="How would you rate your experience with our sales team?",
            type="rating",
            options=["1", "2", "3", "4", "5"]
        ),
        SurveyQuestion(
            id="q4",
            text="What could we improve in our sales process?",
            type="open_ended"
        ),
        SurveyQuestion(
            id="q5",
            text="How likely are you to recommend our dealership to others?",
            type="rating",
            options=["1", "2", "3", "4", "5"]
        ),
        SurveyQuestion(
            id="q6",
            text="Do you have any additional comments or suggestions?",
            type="open_ended"
        )
    ]

    # Initialize survey manager
    survey = SurveyManager(questions)

    @trace
    def loop():
        current_q = survey.get_question_by_id(survey.status.nextQuestionId)
        print(f"\nQuestion: {current_q.text}")
        if current_q.options:
            print(f"Options: {', '.join(current_q.options)}")
        
        response = input("Your answer: ")
        survey.process_response(response)
        
        print(f"Progress: {survey.status.overallProgress}")
        return survey.status.surveyComplete

    # Example usage
    while not survey.status.surveyComplete:
        loop()

if __name__ == "__main__":
    main()