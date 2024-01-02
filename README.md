Required apis in location microservices
VEHICLE -
 1. Receive coordinates from vehicles connected via websockets
 2. Send those coordinates to api-call-servives nearest roads api and get nearest road ids (POST)
 3. Store the nearest road ids along with vehicle socket ids in redis
 
AMBULANCE - 
 1. Receive alert event from ambulance along with ambulance's and hospital's coordinates, connected via websockets
 2. Send those coordinates bound to api-call-services nearest roads api and get all road ids (POST)
 3. Retrive all the vehicle ids associated with above road ids from redis
 4. Send alert notification events to above retreived vehicle socket ids
 