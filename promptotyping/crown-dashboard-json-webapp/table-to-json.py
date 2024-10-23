import pandas as pd
import json
import math
from pandas import Timestamp

def validate_json_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            json.load(file)
        print(f"The file {file_path} contains valid JSON.")
        return True
    except json.JSONDecodeError as e:
        print(f"The file {file_path} contains invalid JSON.")
        print(f"Error: {str(e)}")
        return False

# Function to clean data recursively
def clean_data(data):
    if isinstance(data, dict):
        new_data = {}
        for k, v in data.items():
            v = clean_data(v)  # Recursively clean the value
            if isinstance(v, float) and math.isnan(v):
                continue  # Skip fields with NaN values
            if v is not None:
                new_data[k] = v
        return new_data
    elif isinstance(data, list):
        new_list = []
        for item in data:
            item = clean_data(item)
            if item is not None:
                new_list.append(item)
        return new_list if new_list else None
    elif isinstance(data, float) and math.isnan(data):
        return None  # Replace NaN with None
    elif isinstance(data, Timestamp):
        return data.isoformat()  # Convert Timestamp to ISO format
    else:
        return data

# Function to group fields with common prefixes
def group_fields(data):
    grouped_data = {}
    for key, value in data.items():
        # Skip keys that start with "XXX_"
        if key.startswith("XXX_"):
            continue
        
        if ':' in key:
            prefix, suffix = key.split(':', 1)
            prefix = prefix.strip()
            suffix = suffix.strip()
            if prefix not in grouped_data:
                grouped_data[prefix] = {}
            if isinstance(grouped_data[prefix], dict):
                grouped_data[prefix][suffix] = value
            else:
                # If the prefix already exists but is not a dict, create a new dict with both old and new values
                old_value = grouped_data[prefix]
                grouped_data[prefix] = {'value': old_value, suffix: value}
        else:
            grouped_data[key] = value
    # Recursively group nested dictionaries
    for key, value in grouped_data.items():
        if isinstance(value, dict):
            grouped_data[key] = group_fields(value)
    return grouped_data

# Function to clean up text (removing Excel formatting artifacts)
def clean_text(text):
    if isinstance(text, str):
        return text.replace('_x000d_\n', '\n').strip()
    return text

# Step 1: Load all Excel files into pandas DataFrames
crown_objects_df = pd.read_excel('data/CROWN_Objects_1_2024_02_02.xlsx')
crown_objects_medien_df = pd.read_excel('data/CROWN_Objects_6_Medien_2024_02_02.xlsx')
crown_restaurierung_df = pd.read_excel('data/CROWN_Restaurierung_1_2024_02_02.xlsx')
crown_restaurierung_2_df = pd.read_excel('data/CROWN_Restaurierung_2_2024_02_02.xlsx')
crown_restaurierung_3_medien_df = pd.read_excel('data/CROWN_Restaurierung_3_Medien_2024_02_02.xlsx')
crown_userfields_df = pd.read_excel('data/crown-userfields.xlsx')

# Step 2: Initialize the final list to hold all objects data
all_objects_data = []

# Step 3: Loop through each object in CROWN_Objects
for _, object_row in crown_objects_df.iterrows():
    object_id = object_row['ObjectID']
    object_number = object_row['ObjectNumber']

    # Step 4: Extract object metadata
    object_data = {
        "ObjectID": object_id,
        "ObjectNumber": object_row['ObjectNumber'],
        "ObjectName": object_row['ObjectName'],
        "Dated": object_row['Dated'],
        "DateBegin": object_row['DateBegin'],
        "DateEnd": object_row['DateEnd'],
        "Medium": object_row['Medium'],
        "Dimensions": object_row['Dimensions'],
        "Description": clean_text(object_row['Description']),
        "Authority50ID": object_row['AuthorityID'],
        "Bestandteil": object_row['Bestandteil']
    }
    object_data = clean_data(object_data)  # Clean data

    # Step 5: Extract associated media from CROWN_Objects_6_Medien
    media_files = crown_objects_medien_df[crown_objects_medien_df['ObjectID'] == object_id]
    object_media = []
    for _, media_row in media_files.iterrows():
        media_entry = {
            "MediaMasterID": media_row['MediaMasterID'],
            "RenditionNumber": media_row['RenditionNumber'],
            "MediaType": media_row['MediaType'],
            "Path": media_row['Path'],
            "FileName": media_row['FileName']
        }
        media_entry = clean_data(media_entry)
        object_media.append(media_entry)

    if object_media:
        object_data['Media'] = object_media

    # Step 6: Extract associated interventions from CROWN_Restaurierung
    interventions = crown_restaurierung_df[crown_restaurierung_df['ObjectNumber'] == object_number]
    object_interventions = []

    for _, intervention_row in interventions.iterrows():
        condition_id = intervention_row['ConditionID']

        # Extract detailed intervention data from CROWN_Restaurierung_2
        intervention_details = crown_restaurierung_2_df[crown_restaurierung_2_df['ConditionID'] == condition_id]
        details_list = []
        for _, detail_row in intervention_details.iterrows():
            detail_entry = {
                "CondLineItemID": detail_row['CondLineItemID'],
                "AttributeType": detail_row['AttributeType'],
                "BriefDescription": clean_text(detail_row['BriefDescription']),
                "Statement": clean_text(detail_row['Statement']),
                "Proposal": clean_text(detail_row['Proposal']),
                "ActionTaken": detail_row['ActionTaken'],
                "DateCompleted": detail_row['DateCompleted'],
                "Treatment": clean_text(detail_row['Treatment'])
            }
            detail_entry = clean_data(detail_entry)
            details_list.append(detail_entry)

        # Extract related media from CROWN_Restaurierung_3_Medien
        related_media = crown_restaurierung_3_medien_df[crown_restaurierung_3_medien_df['CondLineItemID'].isin(intervention_details['CondLineItemID'])]
        related_media_list = []
        for _, media_row in related_media.iterrows():
            related_media_entry = {
                "MediaMasterID": media_row['MediaMasterID'],
                "RenditionNumber": media_row['RenditionNumber'],
                "MediaType": media_row['MediaType'],
                "Path": media_row['Path'],
                "FileName": media_row['FileName']
            }
            related_media_entry = clean_data(related_media_entry)
            related_media_list.append(related_media_entry)

        intervention_entry = {
            "SurveyISODate": intervention_row['SurveyISODate'],
            "SurveyType": intervention_row['SurveyType'],
            "Project": intervention_row['Project'],
            "Examiner": {
                "ExaminerID": intervention_row['ExaminerID'],
                "Name": intervention_row['dbo_Constituents_DisplayName']
            },
            "ConditionID": condition_id,
            "Details": details_list,
            "RelatedMedia": related_media_list
        }
        intervention_entry = clean_data(intervention_entry)
        object_interventions.append(intervention_entry)

    if object_interventions:
        object_data['Interventions'] = object_interventions

    # Step 7: Extract condition attributes from CROWN_Userfields
    condition_attributes = crown_userfields_df[crown_userfields_df['ID'] == object_id].to_dict(orient='records')
    if condition_attributes:
        cond_attr = condition_attributes[0]
        cond_attr.pop('ID', None)  # Remove 'ID' field
        cond_attr = clean_data(cond_attr)  # Clean data
        cond_attr = group_fields(cond_attr)  # Group fields
        if cond_attr:
            object_data['ConditionAttributes'] = cond_attr

    # Append this object data to the final list
    if object_data:
        all_objects_data.append(object_data)

# Step 8: Define a custom function to handle non-serializable objects
def custom_json_serializer(obj):
    if isinstance(obj, Timestamp):
        return obj.isoformat()
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

# Step 9: Write and valdiate the final JSON file
file_path = 'crown_data.json'
with open(file_path, 'w', encoding='utf-8') as json_file:
    json.dump(all_objects_data, json_file, default=custom_json_serializer, indent=4, sort_keys=True, ensure_ascii=False)
validate_json_file(file_path)
