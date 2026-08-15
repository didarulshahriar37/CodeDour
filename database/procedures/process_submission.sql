CREATE OR REPLACE PROCEDURE process_submission(
    p_submission_id INT,
    p_status VARCHAR(30),
    p_execution_time DOUBLE PRECISION,
    p_memory_used INT,
    p_error_message TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE submissions
    SET status = p_status,
        execution_time = p_execution_time,
        memory_used = p_memory_used,
        error_message = p_error_message
    WHERE submission_id = p_submission_id;

    COMMIT;
END;
$$;
