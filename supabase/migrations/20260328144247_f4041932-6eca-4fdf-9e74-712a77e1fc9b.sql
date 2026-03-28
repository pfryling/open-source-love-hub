
-- Create a SECURITY DEFINER function to recalculate rating aggregates
CREATE OR REPLACE FUNCTION public.oshub_recalculate_project_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_project_id uuid;
  new_sum numeric;
  new_count integer;
BEGIN
  -- Determine which project to update
  IF TG_OP = 'DELETE' THEN
    target_project_id := OLD.project_id;
  ELSE
    target_project_id := NEW.project_id;
  END IF;

  -- Recalculate from source of truth
  SELECT COALESCE(SUM(rating), 0), COUNT(*)
  INTO new_sum, new_count
  FROM public.oshub_project_ratings
  WHERE project_id = target_project_id;

  -- Update the project
  UPDATE public.oshub_projects
  SET rating_sum = new_sum, rating_count = new_count
  WHERE id = target_project_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on ratings table
CREATE TRIGGER oshub_rating_aggregate_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.oshub_project_ratings
FOR EACH ROW
EXECUTE FUNCTION public.oshub_recalculate_project_rating();
