-- you can use this script to create a user with a role 

insert into users (type, email, first_name, last_name, username, phone_number, is_active, created_at, updated_at)
values ('TENANT_USER', 'admin@getalfred.com', 'Admin', 'Getalfred', 'admin', '+18222111221', true, now(), now());

insert into roles (type, name, created_at, updated_at)
values ('TENANT_ROLE', 'SUPER', now(), now());

insert into user_role (user_id, role_id) VALUES (1, 1);

DO $$
DECLARE permission RECORD;
BEGIN
    FOR permission IN
        SELECT * FROM permissions
    LOOP
        INSERT INTO role_permission (role_id, permission_id) VALUES (1, permission.id);
    END LOOP;
END $$;

