# Research
This section includes my research within my own words.

## UX Research
As my initial briefing for this project after reading and understanding the task, I conducted initial research on statistics regarding **Traffic Operational Staff (道路監視オペレーター)**. Upon investigation, there was no officially published statistics for this demographic in Japan. For noted reason, please note the assumption is for the rest of the research will be using an adjacent field **Traffic Patrol Officer (道路パトロール隊員)**  as reference.

The main key points for this demographic is that they are part of ***Generation X***, which has following pain points to consider.
1. **Lower Tech Exposure**: 1965 - 1980 is commonly known for physical media, such as TV and CD Players, as such modern design language may not be clear to this demographic. Avoid hidden navigation and modern visual languages, such as icons.
2. **Vision Problems**: Gen X is commonly the age where they start to form presbyopia, which could impair vision to read on a digital screen. Base text-size should be 16px for readability, and focus on function over form for accessibility, meaning no low contrast colors (minimum WCAG compliant).
3. **Lower Motor Precision**: Gen X touch and mouse dexterity will be significantly lower than of newer generations due to lack of exposure comparatively to other generations. Touch points should be larger to make ease of access for interactions with our interface.

Additionally, I wanted to find the difference between Japanese and Western design, and found a key point to note between the two:
1. **Noisy design is not often an concern**: Japanese design tends to be verbose and information dense, as accuracy matters more than speed. This should reflect in the design, to avoid too many icons and visual design and focus on text-based communication.

## Brainstorm Map
After understand who I will be designing for this project, I conducted a **brainstorming** session to further ideate on my beliefs on this project.

<img width="739" height="502" alt="image" src="https://github.com/user-attachments/assets/634a9a5f-10bb-4399-9e90-604c412fa673" />

Several thoughts came out of this brainstorm:
1. **Resolving Emergencies is the primary focus**: For this project, I was focused on the user, which is the Traffic Operational Staff, however I had a stronger understanding of the impact, which is that the road should become safer with this application.
2. **Work Environment is primary desktop**: As their job is done on a desktop, my primary focus should be on the desktop experience, and not the mobile experience, which is different as commonly mobile first design is priority.
3. **Communication between environments**: Operational staff must communicate quickly, and be alert if something occurs on previous incidents as well.
4. **Accessibility for Night shifts**: 24/7 shifts include night shifts, so a thought came to mind to implement dark/light mode for preference as it could strain their eyes after operation of long hours.

## User Persona
With my in-depth understanding of the user, a User Persona was created that will represent the design.

<img width="1092" height="834" alt="Persona" src="https://github.com/user-attachments/assets/f28ec2f1-8f35-49a9-b23e-ace6d5256bf7" />

---

## UI Design

## Low Fidelity
For low fidelity prototyping, sketches were created alongside a mood board to iterate quickly and use references on dashboard designs. 

<img width="1219" height="734" alt="image" src="https://github.com/user-attachments/assets/0bae3d0b-7e4a-467f-be4c-7f2c812c2759" />

## Medium Fidelity
Once low fidelity prototyping was finalized, Medium Fidelity Prototypes were created to further finalize structure. Note that in this iteration, I kept close notice to not add too many visual clutter and focus on verbosity to keep within Japanese Design language.

<img width="766" height="583" alt="image" src="https://github.com/user-attachments/assets/4af31833-cdd4-44f3-a008-d34e70cfa7cc" />

## Design System
I've delegated task Claude Design to create the design system, using my user analysis research listed above.

<img width="1656" height="913" alt="image" src="https://github.com/user-attachments/assets/7fa02cfb-e5ec-49da-be55-8221e5f59e3e" />

## High Fidelity
For this project, due to restricted timeline I delegated the high fidelity prototyping within application, using Claude code to implement design system. The following below shows the first design outputted by Claude, using all previous documentation and design system.

<img width="1658" height="959" alt="image" src="https://github.com/user-attachments/assets/c429213f-efb2-4246-9487-020002ef93fe" />
<img width="1659" height="963" alt="image" src="https://github.com/user-attachments/assets/c86f56f8-a5d2-47c1-8dca-0c9af4692ebe" />
<img width="1647" height="960" alt="image" src="https://github.com/user-attachments/assets/b366615a-66f8-48f5-b63e-a6f2879a63b6" />

## Post-Implementation
Once it was finalized, further iterations were conducted. There were a few pain points I had not considered in my initial brief:
1. **Dashboard was cluttered with unnecessary information**: Stat blocks, while nice, because the design was verbose took too much away from the alerts and what the user was assigned to or not.
2. **Unresolved and Unassigned cases took too much of the screen**: An initial draft from the AI included Tab design. At the time, I did not want to use tabs as the user may not understand how to use it as it's modern design language, and hides too much data. However, the page was too long and hard to notice new alerts or see their assigned tasks as it was hidden below the fold.

With the above changes in mind, multiple iterations were made, and into the final product: 
<img width="1660" height="959" alt="image" src="https://github.com/user-attachments/assets/3032f862-6b7e-49c1-b3a7-af9359c442e8" />
<img width="1658" height="954" alt="image" src="https://github.com/user-attachments/assets/e7c6a8f8-8d67-4092-b5a9-73bdb71fb36a" />
<img width="1661" height="963" alt="image" src="https://github.com/user-attachments/assets/e13998f1-4721-400b-94a3-5ddd1c80ad86" />


1. **Merged the Assigned and Unresolved lists together:** Instead of separating them, add an additional column to show assignee, which resolves having two lists. We can also make the assumption that if they are on the dashboard, **only unresolved cases should be shown**.
2. **Infinite scroll instead of pagination**: Instead of a button press, the user can just scroll down to see all remaining unresolved events. As it does not include all incidents, I have made the assumption here that because the list should not be very long, a infinite scroll may be easier to use than pagination.
3. **Remove stat blocks:** Upon further thought, this was not cost efficient use of limited page space as the focus should be on unresolved incidents and removed it in favor of more screen real estate.
