import os
import shutil

def collect_python_files_to_text(folder_path=".", output_file="all_python_files.txt"):
    with open(output_file, 'a') as txt_file:  # Open in append mode
        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.endswith('.py'):
                    py_file_path = os.path.join(root, file)
                    try:
                        with open(py_file_path, 'r') as py_file:
                            txt_file.write(f"\n\n# Contents of: {py_file_path}\n")
                            shutil.copyfileobj(py_file, txt_file)
                            txt_file.write("\n")  # Add newline after each file
                        print(f"Appended {py_file_path} to {output_file}")
                    except Exception as e:
                        print(f"Could not read {py_file_path}: {e}")

# Run the function from the current directory
collect_python_files_to_text()
