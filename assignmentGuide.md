Your task is to design and implement a mobile and web application for a fictitious company so that it can conduct its trading over the Internet.

The fictitious company for which your application will be designed must meet all requirements specified in the following sections.

You are required to use the following technologies to implement the application: HTML5, CSS, JavaScript, jQuery, PHP, Ajax, MySQL, and Apache Cordova. The client-server communication must be achieved using Ajax to speed up the application and to reduce latency. The product and user account details must be kept in the database and never hard coded in your application. Addition, removal or update of the product and account details must not cause any change in your application code. You must not use any web content management system to create this application. You need to obtain a prior approval from the Unit Coordinator if you intend to use any third-party frameworks or libraries not listed above.
A Fictitious Online Trading Company (Back to Beginning)

The first part of this assignment (stage 1) is to write a report describing a fictitious online trading company that sells many different products using its company web and/or mobile application. A company that only sells a small number of products (no more than a few dozens) or a fixed number of products (ie, new products cannot be added or old products cannot be removed dynamically) does not meet our requirement. If unsure, you must consult your tutor or lecturer for clarification.

Note that you are required to provide an English document describing specific aspects of the company and describe how you, as a user, are expected to use this application. No web page design is involved. For example, you do not need to design web page layout, write HTML/JavaScript/PHP code or create any graphical and art work for the application.

In this document, you must include the names and student numbers of the two group members.

Your document should describe the following aspects of the company:

    The company details: name, address, contact phone and email address. Other information such as the directors and key employees can also be included. Check some real company websites for hints on what to include. Of course, none of the above information needs to be real.
    A general introduction to the company. A company always wants to portray itself in the best light possible. Information may include the company mission statement, ethos, historical glory, charitable support given to the local community, as well as other propaganda such as how good its products are, etc. The sort of things you can write here are only limited by your imagination, but be sensible.
    The product information: a general description of the types of products the company sells. Unlike Item 5 below, this is not a description of any individual product. Check some real company websites or mobile apps and see how they promote their products via their companies' websites or mobile apps.
    Online trading: describing how the company sells its products using its web and/or mobile application from the perspective of its users. The way this online trading is conducted can differ widely depending on the types of products it sells. However, you must meet the following requirements:
        The full product details are kept in the database on the server. The user can browse the product list and the relevant product details are then retrieved dynamically from the database on the server and displayed on the client to provide feedback to its user. It is not acceptable to have all product details fully displayed in the client as static information;
        There is more than one way the user can find a specific product from this application, e.g., by browsing product catalog or searching for a specific product with query strings;
        The application should allow or require customers to register with the application, thus gaining more privileged access than available to unregistered users. The application should distinguish the following types of users: occasional visitors, registered customers, and company staff. These three different types of users are allowed to access different parts of the application. For instance, the company staff are allowed to add, delete, or modify the product details in the database, but no other users are allowed to directly change the database. A registered user is able to order products, while an unregistered user is only allowed to search the available products.
    A list of products: you need to compile a list of products. The list must have at least 30 items to allow meaningful search, the more the better. These product details are to be stored in the database.
    Other company information: any other information that may enhance the application or improve the company's public image.

Functional Requirements - Basic (Back to Beginning)

Deveop a web and/or mobile application that provides following basic information and a search facility.

Basic Information: Your application should provide all required company information and meet the following requirements.

    It contains the basic information about the company, for details see points 1, 2, and 3 in the above section.
    It has a consistent navigation system for users to move through your application.
    It provides an online Help for users - instructions on how to use your application.
    It must use HTML5's structural elements to define the overall logical structure of the front end of the application and use CSS to define the visual layout of those structural elements.
    You may include video or audio clips in your application if they are deemed necessary, however in such cases, you must keep their sizes to the absolute minimum.

Search Facility: In addition, your application must have a search facility to allow users to search for details of your products/services. The search facility must meet the following requirements:

    The raw product/service data must be stored in the MySQL database on the server. They must not be hard coded in the HTML pages or dumped in the server file system. The data should be retrieved dynamically from the database and sent to the client in response to user enquiries. If new data are added to the database, your application should not have to be changed in anyway except the contents of the database.
    The search facility must contain code to validate user input to make sure only the valid search query will be sent to the server site for action.
    If a required field is found to be empty or containing invalid data, the user should be forced to re-enter the data.
    Allow at least two levels of search. The first level of search is by keywords, where an entry is retrieved from the database if the user's search term matches any text in any product-related fields in the entry.
    The second level of search is by browsing, where the user can go through different categories of products/services to find what he or she wants.

Shopping Cart: Any user, whether registered or not, can add a product to the shopping cart and remove a product from the shopping cart. The user is able to see a list of products in the shopping cart (but this user would not be able to order these products unless he/she is logged on, see Registered Users below).
Functional Requirements - Advanced (Back to Beginning)

On top of the basic features described above, your application should provide different functionalities to three different types of users of the application: unregistered users, registered customers, and support staff from the company.

    Unregistered Users: anyone without authentication is given access to all basic functionalities specified above, including search products/services by keywords and by browsing the and shopping cart.
    Registered Customers: a registered customer has an account in the application. The customer's details are kept in the database. He/she needs to be authenticated before access is granted. Once access is granted, he/she can modify his or her personal details such as name, address, phone number and email address. He/she can also submit an order for the company's products or services in the shopping cart. After it is validated by the client-side script, this order is sent to the server-side script for processing. The client will then display the confirmation or rejection of the order (perhaps because not enough stock is available). If the order is confirmed, the database should be updated. Please note that anyone can register an account with the application to become a customer of the company without the involvement of the company support staff. A registered user can log on and log off to the website. The website should maintain a sign to show whether the user is currently logged on or not (eg, by displaying the name of the user who is currently logged on).
    Support Staff: a support staff member has an account with the application. He/she needs to be authenticated before access is granted. Once access is granted, he/she can access any customer account without using that customer's password. He/she can also modify product/service details in the database, such as adding a new product to the database, removing an existing product from the database, or changing the details of an existing product (e.g., stock level). Please note that a support staff member can create new support staff accounts.
    The information about the registered customers and support staff must be kept in the database, never hard coded in the application. Adding or removing an account should not change your application code in any way except the contents of the database.

Note that any registered customer and support staff member should still be able to access the basic information and use the search facility just like any unregistered user, whether they are authenticated or not.

To help your tutor mark your assignment, you are required to create three customer accounts and three support staff accounts in your database with the following usernames and passwords:

Username Password
user1 user1
user2 user2
user3 user3
staff1 staff1
staff2 staff2
staff3 staff3

Technical Requirements (Back to Beginning)

The following technical requirements must be met:

    Use only the following technologies: HTML5, CSS, JavaScript, jQuery, Ajax, Cordova, PHP and MySQL. Do not use any web content management system. Do not use any third-party frameworks or libraries unless you have obtained a prior approval from the Unit Coordinator.

    You are required to design and implement the following two front ends (clients) for this application:
        a web front end suitable for large screen size (such as those in a desktop or laptop computer).
        a Cordova front end packaged for mobile phones running Android or iOS.

    As the screen size for the Cordova app is considerably smaller than that of the web front end, the screen layout for the Cordova app may need to be redesigned. It is not acceptable to just to shrink the same screen layout for the small screen Cordova front ends.

    For the Cordova app, you must test the app on a mobile device or on a mobile device emulator such as Android simulator or an iPhone emulator and include these test cases in the test documentation.

    The server part of the application must be written in PHP and MySQL. The same code base should serve both front ends.

    Communication between the client and the server must be achieved by using Ajax with the appropriate data exchange formats such plain text, XML or JSON. Your client will need to communicate with the server when it searches for products, changes product details or updates user accounts.

    The information on the company's products must all be kept in the database on the server. The information about a particular product can be dynamically retrieved from the database in response to user enquiry and sent to the client for display. Addition, removal and update of product details should in no way change the application code or resource.

    The information on customer accounts and staff accounts must all be kept in the database on the server. Adding, removing or updating a user account means changing what are stored in the database, and should in no way change the appication code or resources.

    For the sake of clear structure and sharing of server code, your client and server code as well as resources are to be stored in the following sub-directories:
        Server: the server code and resources must be stored under sub-directory Server. This same server code provides its service to both the web client and the Cordova client.
        WebClient: the client code and resources for the large screen web front end should be placed under sub-directory WebClient
        Cordova: the client code and resources for the client part of Cordova app (i.e., everything under the Cordova project directory of your Cordova app) are placed under sub-directory Cordova (it shares the same server code and resources used by the web front end).

    Except the client part of Cordova code and resources, all the other code and resources of your application must be hosted on the eris server. There is no need (and no point) to host the Cordova code on eris server.

    Both the web application and the Cordova application should be designed as a Single Page Application. Each asynchronous JavaScript client should be placed in a separate JavaScript file and each corresponding PHP server script should be placed in a separate PHP file. The pair of asynchronous JavaScript file and its corresponding PHP script file should use the same file name with different extension name.
